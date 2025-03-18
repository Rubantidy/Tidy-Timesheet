package timesheet.notification;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationService {

	 private final SimpMessagingTemplate messagingTemplate;
	    private final NotificationRepository notificationRepository;

	    @Autowired
	    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository) {
	        this.messagingTemplate = messagingTemplate;
	        this.notificationRepository = notificationRepository;
	    }

	    public void sendNotification(String username, String message) {
	        // ✅ Store in Database
	        Notificationdao notification = new Notificationdao();
	        notification.setUsername(username);
	        notification.setMessage(message);
	        notification.setReaded(false);
	        notification.setTimestamp(LocalDateTime.now());
	        notificationRepository.save(notification);

	        // ✅ Send Real-Time Notification via WebSocket
	        messagingTemplate.convertAndSendToUser(username, "/topic/notifications", Map.of("message", message));
	    }

	    public void sendAdminNotification(String message) {
	        // ✅ Store in Database
	        Notificationdao notification = new Notificationdao();
	        notification.setUsername("admin"); // or store for all admins
	        notification.setMessage(message);
	        notification.setReaded(false);
	        notification.setTimestamp(LocalDateTime.now());
	        notificationRepository.save(notification);

	        // ✅ Send Real-Time Notification via WebSocket
	        messagingTemplate.convertAndSend("/topic/adminNotifications", Map.of("message", message));
	    }
}

