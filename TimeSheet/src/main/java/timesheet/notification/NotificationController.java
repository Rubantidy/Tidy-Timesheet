package timesheet.notification;

import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ Send user-specific notifications in JSON format
    public void sendNotification(String username, String message) {
        Map<String, String> notification = new HashMap<>();
        notification.put("message", message); 

        System.out.println("Sending notification to user: " + username); // Debug log
        messagingTemplate.convertAndSendToUser(username, "/user/topic/notifications", notification);
    }


    // ✅ Send admin notifications in JSON format
    public void sendAdminNotification(String message) {
        Map<String, String> notification = new HashMap<>();
        notification.put("message", message); // Wrap message in JSON format
        messagingTemplate.convertAndSend("/topic/adminNotifications", notification);
    }
}

