export const dimensions = ['branch', 'answer', 'issue', 'rating', 'theme', 'agent', 'period'];
export const withheld = 'Withheld';
export const minimum = 5;

export function select(cells, filters, except) {
  return cells.filter(cell => dimensions.every(key =>
    key === except || !filters[key]?.length || filters[key].includes(cell[key])));
}

export function metrics(cells) {
  const count = (predicate = () => true) => cells.reduce((n, cell) => n + (predicate(cell) ? cell.n : 0), 0);
  const eligible = c => c.answer === 'Yes' && ['Yes', 'No'].includes(c.issue);
  return {
    total: count(), answered: count(c => c.answer === 'Yes'),
    knownAnswer: count(c => ['Yes', 'No'].includes(c.answer)),
    eligible: count(eligible), issues: count(c => eligible(c) && c.issue === 'Yes'),
    high: count(c => eligible(c) && c.rating === '9–10'),
    rated: count(c => eligible(c) && ['1–8', '9–10'].includes(c.rating)),
    highIssue: count(c => eligible(c) && c.issue === 'Yes' && c.rating === '9–10'),
    ratedIssue: count(c => eligible(c) && c.issue === 'Yes' && ['1–8','9–10'].includes(c.rating))
  };
}

const vocabulary = {
  branch: /^(Platz|Chill Out|Maadi|Zayed|other|Nasr City|Leven|New Giza|Poly Park|Unclassified)$/,
  answer: /^(Yes|No|Unknown)$/,
  issue: /^(Yes|No|Unknown)$/,
  rating: /^(1–8|9–10|Unknown)$/,
  theme: /^(Temperature|Order accuracy|Portion|Delivery|Packaging|Bread|Multiple candidates|No tagged theme)$/,
  agent: /^(Agent [1-9]\d{0,3}|Unknown)$/,
  period: /^(20\d{2}-(0[1-9]|1[0-2])|Unknown)$/
};

export function valid(data) {
  return data?.schema === 1 && /^[a-f0-9]{64}$/.test(data.dataset_version)
    && ['source_last_checked_at', 'data_last_changed_at', 'last_successful_processing_at'].every(key =>
      typeof data[key] === 'string' && Number.isFinite(Date.parse(data[key])))
    && Array.isArray(data.cells) && data.cells.length > 0
    && data.cells.every(cell => cell && Object.keys(cell).length === dimensions.length + 1
      && Number.isSafeInteger(cell.n) && cell.n >= minimum
      && dimensions.every(key => typeof cell[key] === 'string' && (cell[key] === withheld || vocabulary[key].test(cell[key]))));
}


