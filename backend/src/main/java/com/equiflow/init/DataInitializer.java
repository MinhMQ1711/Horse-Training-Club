package com.equiflow.init;

import com.equiflow.modules.account.entity.AccountStatus;
import com.equiflow.modules.account.entity.PermissionHelper;
import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.account.entity.User;
import com.equiflow.modules.account.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        String defaultPass = passwordEncoder.encode("equiflow123");

        User viet = createUser("viet", "Đỗ Quốc Việt", "viet.do@gmail.com", defaultPass, "0989 100 200",
                RoleType.CLUB_MANAGER, AccountStatus.ACTIVE, null, null, null);

        User minh = createUser("minh", "Mai Quang Minh", "Minhmaiki@gmail.com", passwordEncoder.encode("123456"), "0900 000 001",
                RoleType.CLUB_MANAGER, AccountStatus.ACTIVE, null, null, null);

        User nam = createUser("nam", "Trần Văn Nam", "nam.tran@gmail.com", defaultPass, "0912 445 118",
                RoleType.HEAD_TRAINER, AccountStatus.ACTIVE, null, null, null);

        User chau = createUser("chau", "Lê Minh Châu", "chau.le@gmail.com", defaultPass, "0903 221 764",
                RoleType.VETERINARIAN, AccountStatus.ACTIVE, null, null, null);

        User binh = createUser("binh", "Phạm Thị Bình", "binh.pham@gmail.com", defaultPass, "0977 310 552",
                RoleType.GROOM, AccountStatus.LOCKED, null, null, Instant.now());

        User ha = createUser("ha", "Lý Thu Hà", "ha.ly@gmail.com", defaultPass, "0945 882 306",
                RoleType.HORSE_OWNER, AccountStatus.ACTIVE, null, null, null);

        User khoi = createUser("khoi", "Vũ Đình Khôi", "khoi.vu@gmail.com", defaultPass, "0918 777 043",
                RoleType.HORSE_OWNER, AccountStatus.ACTIVE, null, null, null);

        User anh = createUser("anh", "Nguyễn Hoàng Anh", "anh.nguyen@gmail.com", defaultPass, "0938 640 019",
                RoleType.HORSE_OWNER, AccountStatus.PENDING_APPROVAL, Instant.now(), "REQ-2609-012", null);

        userRepository.saveAll(List.of(viet, minh, nam, chau, binh, ha, khoi, anh));
    }

    private User createUser(String id, String fullName, String email, String password, String phone,
                            RoleType role, AccountStatus status, Instant requestedAt, String requestCode, Instant lockedAt) {
        User user = new User();
        user.setId(id);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(password);
        user.setPhone(phone);
        user.setRole(role);
        user.setStatus(status);
        user.setCreatedAt(Instant.now());
        user.setRequestedAt(requestedAt);
        user.setRequestCode(requestCode);
        user.setLockedAt(lockedAt);
        user.setPermissions(PermissionHelper.defaultPermissions(role));
        user.setNotify(PermissionHelper.defaultNotify(role));
        return user;
    }
}
