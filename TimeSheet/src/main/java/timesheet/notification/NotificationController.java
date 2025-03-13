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

    // ✅ Send notification to a specific employee
    public void sendNotification(String username, String message) {
        Map<String, String> notification = new HashMap<>();
        notification.put("message", message);
        notification.put("username", username); // ✅ Include username for client-side filtering

        System.out.println("✅ Sending WebSocket Notification to user: " + username + " -> " + message);
        messagingTemplate.convertAndSendToUser(username, "/topic/notifications", notification);
    }

    // ✅ Send admin notifications in JSON format
    public void sendAdminNotification(String message) {
        Map<String, String> notification = new HashMap<>();
        notification.put("message", message); // Wrap message in JSON format
        messagingTemplate.convertAndSend("/topic/adminNotifications", notification);
    }
}

