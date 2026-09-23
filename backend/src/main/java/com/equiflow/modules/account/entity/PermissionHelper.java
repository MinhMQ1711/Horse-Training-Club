package com.equiflow.modules.account.entity;

import java.util.HashMap;
import java.util.Map;

public class PermissionHelper {

    public static Map<String, Boolean> defaultPermissions(RoleType role) {
        Map<String, Boolean> map = new HashMap<>();
        map.put("viewHorses", true);
        map.put("editHorses", role == RoleType.CLUB_MANAGER || role == RoleType.HEAD_TRAINER);
        map.put("deleteHorses", role == RoleType.CLUB_MANAGER);
        map.put("createPlan", role == RoleType.HEAD_TRAINER);
        map.put("assignSchedule", role == RoleType.HEAD_TRAINER);
        map.put("recordMetrics", role == RoleType.HEAD_TRAINER);
        map.put("ackAlerts", role == RoleType.HEAD_TRAINER);
        map.put("viewMedical", role == RoleType.CLUB_MANAGER || role == RoleType.VETERINARIAN || role == RoleType.HEAD_TRAINER);
        map.put("placeLock", role == RoleType.VETERINARIAN);
        map.put("liftLock", role == RoleType.VETERINARIAN);
        map.put("manageAccounts", role == RoleType.CLUB_MANAGER);
        map.put("viewAudit", role == RoleType.CLUB_MANAGER);
        return map;
    }

    public static Map<String, Boolean> defaultNotify(RoleType role) {
        Map<String, Boolean> map = new HashMap<>();
        map.put("thresholdAlert", role == RoleType.HEAD_TRAINER);
        map.put("lockLifted", role == RoleType.HEAD_TRAINER || role == RoleType.HORSE_OWNER);
        map.put("dailyDigest", true);
        map.put("raceResults", role == RoleType.HORSE_OWNER || role == RoleType.HEAD_TRAINER);
        return map;
    }
}
