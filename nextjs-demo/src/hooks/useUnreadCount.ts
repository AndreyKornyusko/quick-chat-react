"use client";

import { useState } from "react";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  return { unreadCount, setUnreadCount };
}
