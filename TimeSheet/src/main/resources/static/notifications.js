document.addEventListener("DOMContentLoaded", function () {
    let stompClient = null;
    let notificationCount = 0;
    let currentEmployee = "employeeUsername"; // ✅ Update dynamically from session/backend
    let unseenNotifications = []; // ✅ Store notifications until viewed

    function connectWebSocket() {
        console.log("🔄 Connecting to WebSocket...");
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function () {
            console.log("✅ Connected to WebSocket!");

            // ✅ Admin Panel: Listen for notifications 
            stompClient.subscribe('/topic/adminNotifications', function (notification) {
                const data = JSON.parse(notification.body);
                console.log("🔔 Admin Notification Received:", data.message);
                showNotification(data.message, "admin");
            });

            // ✅ Employee Panel: Listen for user-specific notifications
            stompClient.subscribe('/user/topic/notifications', function (notification) {
                const data = JSON.parse(notification.body);
                console.log("🔔 Employee Notification Received:", data.message);

                // ✅ Ensure only the logged-in employee gets their notifications
                if (data.username === currentEmployee) {
                    showNotification(data.message, "employee");
                }
            });
        }, function (error) {
            console.error("❌ WebSocket Error:", error);
            retryConnection();
        });
    }

    function showNotification(message, panelType) {
        const badge = document.getElementById("notificationCount");
        const notificationList = document.getElementById("notificationList");

        if (!badge || !notificationList) return; // ✅ Ensure elements exist

        notificationCount++;
        badge.style.display = "inline";
        badge.textContent = notificationCount;

        // ✅ Create notification entry
        const notificationItem = document.createElement("div");
        notificationItem.className = "dropdown-item";
       

        // ✅ Store unseen notifications
        unseenNotifications.push(notificationItem);

        notificationList.prepend(notificationItem);
    }

    // ✅ Show notifications and start deletion timer for viewed ones
    window.toggleNotifications = function () {
        const dropdown = document.getElementById("notificationDropdown");

        if (dropdown) {
            dropdown.classList.toggle("show");

            if (dropdown.classList.contains("show")) {
                // ✅ Remove notifications after 5 minutes once viewed
                unseenNotifications.forEach((item, index) => {
                    setTimeout(() => {
                        item.remove();
                        unseenNotifications.splice(index, 1);
                        if (unseenNotifications.length === 0) {
                            document.getElementById("notificationCount").style.display = "none";
                        }
                    }, 5 * 60 * 1000); // ✅ Remove after 5 minutes
                });

                unseenNotifications = []; // ✅ Clear array after setting removal timers
            }
        }

        // ✅ Reset badge when viewed
        notificationCount = 0;
        const badge = document.getElementById("notificationCount");
        if (badge) {
            badge.style.display = "none";
        }
    };

    // ✅ Close notifications when clicking outside
    document.addEventListener("click", function (event) {
        const dropdown = document.getElementById("notificationDropdown");
        const bellIcon = document.getElementById("notificationBell");

        if (dropdown && bellIcon) {
            if (!dropdown.contains(event.target) && !bellIcon.contains(event.target)) {
                dropdown.classList.remove("show"); // ✅ Close dropdown if clicked outside
            }
        }
    });

    function retryConnection() {
        console.log("🔄 Retrying WebSocket Connection in 3s...");
        setTimeout(connectWebSocket, 3000);
    }

    // ✅ Ensure the bell icon exists before adding event listener
    const bellIcon = document.getElementById("notificationBell");
    if (bellIcon) {
        bellIcon.addEventListener("click", window.toggleNotifications);
    } else {
        console.error("❌ Notification bell icon not found.");
    }

    // ✅ Connect WebSocket
    connectWebSocket();
});
