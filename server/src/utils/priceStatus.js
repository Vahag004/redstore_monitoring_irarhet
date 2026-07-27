// Compares a competitor shop's price against our own (RedStore) price and
// returns a status string the frontend can map to a color:
//   "cheaper"        — competitor price is LOWER than ours   (bad for us    -> e.g. red)
//   "more_expensive" — competitor price is HIGHER than ours  (good for us   -> e.g. green)
//   "equal"          — same price                            (neutral       -> e.g. yellow)
//   "unknown"        — our own price could not be determined (no comparison possible -> e.g. gray)
function computePriceStatus(competitorPrice, ourPrice) {
  if (ourPrice === null || ourPrice === undefined || competitorPrice === null || competitorPrice === undefined) {
    return "unknown";
  }
  if (competitorPrice < ourPrice) return "cheaper";
  if (competitorPrice > ourPrice) return "more_expensive";
  return "equal";
}

module.exports = { computePriceStatus };
