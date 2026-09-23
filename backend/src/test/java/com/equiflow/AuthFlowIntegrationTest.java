package com.equiflow;

import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.auth.dto.LoginRequest;
import com.equiflow.modules.auth.dto.RegisterRequest;
import com.equiflow.modules.auth.dto.VerifyEmailRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCompleteAuthAndRegistrationFlow() throws Exception {
        // 1. Test Login happy case for seeded Club Manager
        LoginRequest managerLogin = new LoginRequest();
        managerLogin.setEmail("viet.do@gmail.com");
        managerLogin.setPassword("equiflow123");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(managerLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("viet.do@gmail.com"))
                .andExpect(jsonPath("$.user.role").value("CLUB_MANAGER"))
                .andReturn();

        MockHttpSession managerSession = (MockHttpSession) loginResult.getRequest().getSession();

        // 2. Test Login with wrong password -> 401 INVALID_CREDENTIALS
        LoginRequest wrongLogin = new LoginRequest();
        wrongLogin.setEmail("viet.do@gmail.com");
        wrongLogin.setPassword("wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        // 3. Register a new Horse Owner
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Test Owner");
        registerReq.setEmail("test.owner@gmail.com");
        registerReq.setPassword("Password123!");
        registerReq.setRole(RoleType.HORSE_OWNER);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test.owner@gmail.com"));

        // 4. Verify OTP code
        VerifyEmailRequest verifyReq = new VerifyEmailRequest();
        verifyReq.setEmail("test.owner@gmail.com");
        verifyReq.setCode("123456");

        mockMvc.perform(post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestCode").exists());

        // 5. Try to login while PENDING_APPROVAL -> 403 ACCOUNT_PENDING
        LoginRequest pendingLogin = new LoginRequest();
        pendingLogin.setEmail("test.owner@gmail.com");
        pendingLogin.setPassword("Password123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pendingLogin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_PENDING"));

        // 6. Club Manager lists accounts and approves test.owner
        MvcResult accountsResult = mockMvc.perform(get("/accounts")
                        .session(managerSession))
                .andExpect(status().isOk())
                .andReturn();

        String accountsJson = accountsResult.getResponse().getContentAsString();
        // find id for test.owner@gmail.com
        String testUserId = objectMapper.readTree(accountsJson).get("accounts")
                .findParents("email").stream()
                .filter(node -> "test.owner@gmail.com".equals(node.get("email").asText()))
                .findFirst()
                .map(node -> node.get("id").asText())
                .orElseThrow();

        mockMvc.perform(post("/accounts/" + testUserId + "/approve")
                        .session(managerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.account.status").value("ACTIVE"));

        // 7. Test newly approved owner login -> 200 OK
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pendingLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.user.role").value("HORSE_OWNER"));
    }
}
