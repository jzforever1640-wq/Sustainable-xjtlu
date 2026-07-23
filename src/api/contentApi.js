let contentPromise;

export const getContent = async () => {
  if (!contentPromise) contentPromise = fetch('/data/content.json').then((res) => res.json());
  return contentPromise;
};

export const searchContent = async (query) => {
  const content = await getContent();
  const term = query.trim().toLowerCase();
  const groups = ['news', 'blogs', 'activities', 'topics'];
  if (!term) return [];
  return groups.flatMap((group) => content[group].map((item) => ({ ...item, group })))
    .filter((item) => Object.values(item).join(' ').toLowerCase().includes(term));
};
