# Stock Reorder Helper

A free, browser-based stock reorder calculator for independent shops, makers and small businesses.

## What it does

- Estimates a reorder point from average daily sales, supplier lead time and safety stock.
- Estimates how many days of stock remain at the stated sales rate.
- Calculates a suggested order quantity from a target stock level.
- Runs locally in the browser without an account, analytics, external libraries or data upload.

## Use it

Open `index.html` in a modern browser. Enter your own figures and select **Calculate reorder advice**.

## Formulas

- **Reorder point** = average units sold per day × supplier lead time in days + safety stock.
- **Estimated days left** = current stock ÷ average units sold per day.
- **Suggested order** = max(0, desired stock after delivery − current stock).

The suggested order is a simple planning estimate. It does not account for outstanding purchase orders, seasonal demand, minimum order quantities, pack sizes, supplier delays or stock already committed to customers.

## Privacy

All calculations happen in the browser. The tool does not send or save the values entered.

## License

MIT. See [LICENSE](LICENSE).

## Contributions

Bug reports, accessibility improvements, translations and suggestions are welcome. Please open an issue describing the proposed change.