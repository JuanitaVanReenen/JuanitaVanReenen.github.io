import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreVideo, rankVideos } from '../src/discovery.js';

test('TRAVEL has a stronger discovery contribution than LOVE', () => {
  const base = {
    id:'a', creatorId:'c', status:'PUBLISHED',
    createdAt:new Date().toISOString(),
    reactions:{}, avgCompletion:0.5, replayRate:0,
    shareCount:0, commentCount:0, followCount:0
  };
  const love = scoreVideo({...base, reactions:{LOVE:1}}, 'u');
  const travel = scoreVideo({...base, reactions:{TRAVEL:1}}, 'u');
  assert.ok(travel > love);
});

test('rankVideos excludes unpublished videos', () => {
  const videos = [
    {id:'1',creatorId:'a',status:'PUBLISHED',createdAt:new Date().toISOString(),reactions:{},avgCompletion:.8,replayRate:.1,shareCount:1,commentCount:1,followCount:1},
    {id:'2',creatorId:'b',status:'DRAFT',createdAt:new Date().toISOString(),reactions:{TRAVEL:100},avgCompletion:1,replayRate:1,shareCount:99,commentCount:99,followCount:99}
  ];
  assert.deepEqual(rankVideos(videos,'u').map(v=>v.id), ['1']);
});
