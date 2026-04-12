"use client";

import { TrackingEvent } from "./types";

class CourseTracker {
  private events: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private courseId: string | null = null;
  private static readonly FLUSH_INTERVAL = 30000; // 30 seconds

  start(courseId: string) {
    this.courseId = courseId;
    this.events = [];

    // Auto-flush events every 30 seconds
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flush();
    }, CourseTracker.FLUSH_INTERVAL);
  }

  track(event: Omit<TrackingEvent, "timestamp">) {
    if (!this.courseId) {
      console.warn("CourseTracker: courseId not set. Call start() first.");
      return;
    }

    const trackingEvent: TrackingEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(trackingEvent);
  }

  private async flush() {
    if (this.events.length === 0) {
      return;
    }

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: this.courseId,
          events: eventsToFlush,
        }),
      });
    } catch (error) {
      console.error("Failed to flush tracking events:", error);
      // Re-add events to retry later
      this.events.unshift(...eventsToFlush);
    }
  }

  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Final flush of remaining events
    if (this.events.length > 0) {
      this.flush();
    }

    this.courseId = null;
  }
}

export const courseTracker = new CourseTracker();
