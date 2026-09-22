import crypto from 'node:crypto';

export function createStore() {
  const users = new Map();
  const videos = new Map();
  const follows = new Set();
  const comments = new Map();
  const reactions = new Map();
  const notifications = new Map();
  const events = [];

  const id = prefix => prefix + '_' + crypto.randomUUID();

  return {
    users, videos, follows, comments, reactions, notifications, events, id,
    addEvent(event) {
      events.push({ ...event, id: id('evt'), createdAt: new Date().toISOString() });
    }
  };
}
