import { PODCAST_EPISODES } from '../../src/lib/mock-podcast-data';

export const podcastSeedData = PODCAST_EPISODES.map(episode => ({
  episodeNumber: episode.episodeNumber,
  title: episode.title,
  spotifyUrl: episode.spotifyUrl,
  youtubeUrl: episode.youtubeUrl,
  published: true
}));
