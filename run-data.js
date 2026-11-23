/* Output of one real run of the orders lakehouse pipeline (synthetic data). */
window.RUN_DATA = {
 "summary": {
  "total_seconds": 52.6,
  "max_reject_rate": 0.15,
  "stages": {
   "bronze": {
    "orders_rows": 1020510,
    "batches": 2,
    "schema_drift": [
     {
      "batch": "b002",
      "renamed": {
       "qty": "quantity"
      },
      "extra_columns": [
       "coupon_code"
      ]
     }
    ],
    "seconds": 13.9
   },
   "silver_dimensions": {
    "customers_rows": 20000,
    "products_rows": 2000,
    "seconds": 2.6
   },
   "silver_orders": {
    "bronze_rows": 1020510,
    "duplicates_and_superseded_removed": 120510,
    "distinct_orders": 900000,
    "silver_rows": 831479,
    "quarantine_rows": 68521,
    "reject_rate": 0.076134,
    "failures_by_rule": {
     "unit_price_valid": 11985,
     "order_ts_parseable": 4447,
     "product_exists": 8147,
     "currency_known": 6217,
     "status_known": 3555,
     "quantity_positive": 8899,
     "customer_id_not_null": 13289,
     "customer_exists": 8800,
     "order_ts_not_future": 5431
    },
    "seconds": 26.0
   },
   "gold": {
    "tables": {
     "daily_revenue": 365,
     "product_performance": 2000,
     "customer_ltv": 20000,
     "dq_scorecard": 9
    },
    "seconds": 7.2
   },
   "evaluation": {
    "orders_scored": 900000,
    "injected_defective_orders": 68521,
    "caught": 68521,
    "missed": 0,
    "false_rejects": 0,
    "rule_mismatches": {
     "customer_id_not_null": 0,
     "quantity_positive": 0,
     "unit_price_valid": 0,
     "currency_known": 0,
     "order_ts_parseable": 0,
     "order_ts_not_future": 0,
     "customer_exists": 0,
     "product_exists": 0,
     "status_known": 0
    },
    "seconds": 2.9
   }
  }
 },
 "monthly": [
  {
   "month": "2025-01",
   "net_cr": 2.93,
   "orders": 24220
  },
  {
   "month": "2025-02",
   "net_cr": 4.18,
   "orders": 35598
  },
  {
   "month": "2025-03",
   "net_cr": 5.67,
   "orders": 47993
  },
  {
   "month": "2025-04",
   "net_cr": 6.37,
   "orders": 53725
  },
  {
   "month": "2025-05",
   "net_cr": 7.26,
   "orders": 61074
  },
  {
   "month": "2025-06",
   "net_cr": 7.55,
   "orders": 63973
  },
  {
   "month": "2025-07",
   "net_cr": 8.45,
   "orders": 71324
  },
  {
   "month": "2025-08",
   "net_cr": 8.94,
   "orders": 75412
  },
  {
   "month": "2025-09",
   "net_cr": 9.06,
   "orders": 76568
  },
  {
   "month": "2025-10",
   "net_cr": 9.78,
   "orders": 82638
  },
  {
   "month": "2025-11",
   "net_cr": 9.87,
   "orders": 83168
  },
  {
   "month": "2025-12",
   "net_cr": 10.68,
   "orders": 90031
  }
 ],
 "top_products": [
  {
   "name": "Pro Speaker 1",
   "category": "Sports",
   "orders": 8574,
   "units": 15432,
   "net_lakh": 123.8,
   "return_rate": 0.059
  },
  {
   "name": "Lite Watch 3",
   "category": "Toys",
   "orders": 5142,
   "units": 9228,
   "net_lakh": 94.3,
   "return_rate": 0.0533
  },
  {
   "name": "Compact Lamp 17",
   "category": "Home",
   "orders": 2054,
   "units": 3716,
   "net_lakh": 64.7,
   "return_rate": 0.0672
  },
  {
   "name": "Prime Notebook 45",
   "category": "Sports",
   "orders": 1287,
   "units": 2326,
   "net_lakh": 63.6,
   "return_rate": 0.0606
  },
  {
   "name": "Compact Notebook 28",
   "category": "Fashion",
   "orders": 1584,
   "units": 2808,
   "net_lakh": 61.1,
   "return_rate": 0.06
  }
 ],
 "quarantine_sample": [
  {
   "order_id": "ORD-0000021",
   "customer_id": "C002985",
   "product_id": "P1497",
   "quantity": "4",
   "unit_price": "543.61",
   "currency": "usd",
   "order_ts": "2025-08-02 03:05:12",
   "failed": [
    "currency_known"
   ]
  },
  {
   "order_id": "ORD-0000041",
   "customer_id": "C015539",
   "product_id": "P0305",
   "quantity": "2",
   "unit_price": "525.93",
   "currency": "INR",
   "order_ts": "2025-13-45 99:99:99",
   "failed": [
    "order_ts_parseable"
   ]
  },
  {
   "order_id": "ORD-0000078",
   "customer_id": null,
   "product_id": "P0940",
   "quantity": "1",
   "unit_price": "71.20",
   "currency": "INR",
   "order_ts": "2025-08-19 13:04:09",
   "failed": [
    "customer_id_not_null"
   ]
  },
  {
   "order_id": "ORD-0000109",
   "customer_id": "C918083",
   "product_id": "P0052",
   "quantity": "2",
   "unit_price": "1552.69",
   "currency": "INR",
   "order_ts": "2025-06-08 09:51:10",
   "failed": [
    "customer_exists"
   ]
  },
  {
   "order_id": "ORD-0000154",
   "customer_id": "C016801",
   "product_id": "P0343",
   "quantity": "1",
   "unit_price": "6.50",
   "currency": "EUR",
   "order_ts": "2030-08-19 00:25:57",
   "failed": [
    "order_ts_not_future"
   ]
  }
 ],
 "scorecard": [
  {
   "rule": "customer_id_not_null",
   "description": "Every order has a customer ID",
   "failed_orders": 13289,
   "pct_of_orders": 1.477
  },
  {
   "rule": "unit_price_valid",
   "description": "Unit price is a number above zero",
   "failed_orders": 11985,
   "pct_of_orders": 1.332
  },
  {
   "rule": "quantity_positive",
   "description": "Quantity is a whole number above zero",
   "failed_orders": 8899,
   "pct_of_orders": 0.989
  },
  {
   "rule": "customer_exists",
   "description": "Customer ID exists in the customer table",
   "failed_orders": 8800,
   "pct_of_orders": 0.978
  },
  {
   "rule": "product_exists",
   "description": "Product ID exists in the product table",
   "failed_orders": 8147,
   "pct_of_orders": 0.905
  },
  {
   "rule": "currency_known",
   "description": "Currency is INR, USD, EUR or GBP",
   "failed_orders": 6217,
   "pct_of_orders": 0.691
  },
  {
   "rule": "order_ts_not_future",
   "description": "Order time is not after the run time",
   "failed_orders": 5431,
   "pct_of_orders": 0.603
  },
  {
   "rule": "order_ts_parseable",
   "description": "Order time is a valid timestamp",
   "failed_orders": 4447,
   "pct_of_orders": 0.494
  },
  {
   "rule": "status_known",
   "description": "Status is a known lifecycle value",
   "failed_orders": 3555,
   "pct_of_orders": 0.395
  }
 ],
 "log": [
  "13:52:24 INFO    lakehouse.run: stage bronze: start",
  "13:52:27 WARNING lakehouse.bronze: schema drift in batch b002: renamed={'qty': 'quantity'} extra=['coupon_code']",
  "13:52:38 INFO    lakehouse.bronze: bronze orders: 1020510 rows from 2 batches",
  "13:52:38 INFO    lakehouse.run: stage bronze: done in 13.9s",
  "13:52:38 INFO    lakehouse.run: stage silver_dimensions: start",
  "13:52:40 INFO    lakehouse.run: stage silver_dimensions: done in 2.6s",
  "13:52:40 INFO    lakehouse.run: stage silver_orders: start",
  "13:53:06 INFO    lakehouse.silver: silver orders: 831479 valid, 68521 quarantined, 120510 superseded or duplicate rows removed",
  "13:53:06 INFO    lakehouse.run: stage silver_orders: done in 26.0s",
  "13:53:06 INFO    lakehouse.run: quality gate passed: reject rate 7.61% (limit 15.00%)",
  "13:53:06 INFO    lakehouse.run: stage gold: start",
  "13:53:09 INFO    lakehouse.gold: gold.daily_revenue: 365 rows",
  "13:53:11 INFO    lakehouse.gold: gold.product_performance: 2000 rows",
  "13:53:12 INFO    lakehouse.gold: gold.customer_ltv: 20000 rows",
  "13:53:14 INFO    lakehouse.gold: gold.dq_scorecard: 9 rows",
  "13:53:14 INFO    lakehouse.run: stage gold: done in 7.2s",
  "13:53:14 INFO    lakehouse.run: stage evaluation: start",
  "13:53:17 INFO    lakehouse.run: stage evaluation: done in 2.9s",
  "13:53:17 INFO    lakehouse.run: summary written to /home/claude/run-data/run_summary.json (status SUCCEEDED)"
 ]
};
