document.addEventListener("DOMContentLoaded", function () {
    console.log("Notification JS loaded");

    const bellIcon = document.getElementById("notificationBell");
    const notificationCount = document.getElementById("notificationCount");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const notificationList = document.getElementById("notificationList");

    // ✅ Establish WebSocket connection
    var socket = new SockJS('/ws');
    var stompClient = Stomp.over(socket); 

    stompClient.connect({}, function (frame) {
        console.log("Connected to WebSocket");

        // ✅ Subscribe to user-specific notifications
        stompClient.subscribe('/user/topic/notifications', function (message) {
            handleWebSocketMessage("User Notification Received", message);
        });

        // ✅ Subscribe to admin notifications
        stompClient.subscribe('/topic/adminNotifications', function (message) {
            handleWebSocketMessage("Admin Notification Received", message);
        });

    }, function (error) {
        console.error("WebSocket Error:", error);
    });

    function handleWebSocketMessage(type, message) {
        console.log(`${type}:`, message.body);

        let notificationText;

        try {
            console.log("Attempting to parse JSON...");
            const parsedMessage = JSON.parse(message.body);
            console.log("Parsed JSON:", parsedMessage);

            if (typeof parsedMessage === "object" && parsedMessage !== null) {
                notificationText = parsedMessage.message || "New Notification";
            } else {
                console.error("Invalid JSON structure:", parsedMessage);
                notificationText = message.body; // Fallback to plain text
            }
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            console.warn("Received message is not JSON, treating as plain text.");
            notificationText = message.body;
        }

        showNotification(notificationText);
    }

    function showNotification(notificationText) {
        if (!notificationText) return;

        const notificationItem = document.createElement("div");
        notificationItem.classList.add("dropdown-item");
        notificationItem.textContent = notificationText;

        notificationList.prepend(notificationItem); // Add new notifications at the top

        // ✅ Update notification count
        let currentCount = parseInt(notificationCount.textContent) || 0;
        currentCount++;
        notificationCount.textContent = currentCount;
        notificationCount.style.display = "inline"; // Show badge
    }

    // ✅ Function to toggle the notification dropdown
    window.toggleNotifications = function () {
        if (notificationDropdown) {
            notificationDropdown.classList.toggle("show");

            // ✅ Reset notification count when opened
            if (notificationDropdown.classList.contains("show")) {
                notificationCount.textContent = "0";
                notificationCount.style.display = "none";
            }
        } else {
            console.error("Notification dropdown element not found!");
        }
    };

    // ✅ Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!bellIcon.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.remove("show");
        }
    });
});
