self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Kabootar", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Kabootar";
  const options = {
    body: data.body || "",
    icon: "/Kabootar-messanger-/icon.svg",
    badge: "/Kabootar-messanger-/icon.svg",
    tag: "kabootar-message"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/Kabootar-messanger-/");
    })
  );
});
