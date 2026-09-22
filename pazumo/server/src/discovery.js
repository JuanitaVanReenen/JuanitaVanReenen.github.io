const REACTION_WEIGHT = {
  LOVE: 2.0,
  FUNNY: 1.7,
  WOW: 2.4,
  CURIOUS: 1.5,
  TRAVEL: 4.0
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function scoreVideo(video, viewerId, context = {}) {
  const reactions = video.reactions || {};
  const weightedReactions = Object.entries(reactions)
    .reduce((sum, [type, count]) => sum + (REACTION_WEIGHT[type] || 0) * Number(count || 0), 0);

  const completion = clamp(Number(video.avgCompletion || 0), 0, 1);
  const replayRate = clamp(Number(video.replayRate || 0), 0, 1);
  const shares = Number(video.shareCount || 0);
  const comments = Number(video.commentCount || 0);
  const follows = Number(video.followCount || 0);
  const ageHours = Math.max(0, (Date.now() - new Date(video.createdAt).getTime()) / 36e5);
  const freshness = 1 / (1 + ageHours / 36);
  const followedCreator = context.following?.has(video.creatorId) ? 1 : 0;

  return (
    weightedReactions * 0.20 +
    completion * 35 +
    replayRate * 12 +
    shares * 1.5 +
    comments * 1.0 +
    follows * 1.2 +
    freshness * 8 +
    followedCreator * 5
  );
}

export function rankVideos(videos, viewerId, context = {}) {
  return [...videos]
    .filter(v => v.status === 'PUBLISHED')
    .map(v => ({ ...v, discoveryScore: scoreVideo(v, viewerId, context) }))
    .sort((a, b) => b.discoveryScore - a.discoveryScore);
}
