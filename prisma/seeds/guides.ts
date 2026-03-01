import { GUIDES } from '../../src/lib/mock-guides-data';

export const guideSeedData = GUIDES.map(guide => ({
  title: guide.title,
  coverTitle: guide.coverTitle || guide.title,
  theme: guide.theme,
  href: guide.href,
  published: true
}));
