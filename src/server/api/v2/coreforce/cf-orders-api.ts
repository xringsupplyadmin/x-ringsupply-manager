import { z } from "zod/v4";
import { makeApiRequest, parseApiResponse } from "./cf-api-util";
import {
  CoreforceOrder,
  type OrderStatusCode,
} from "~/server/api/v2/coreforce/types/orders";

export async function getOrderIds(filter: {
  since: Date;
  until?: Date;
  allowLargeRanges?: boolean;
  statusCode?: OrderStatusCode;
}) {
  const { since, until, allowLargeRanges, statusCode } = filter;

  if (!allowLargeRanges) {
    const end = until ?? new Date();
    const range = end.getTime() - since.getTime();

    if (range > 14 * 24 * 60 * 60 * 1000) {
      // no more than 14 days
      throw new Error("Range too large");
    }
  }

  const response = await makeApiRequest("get_order_ids", {
    start_date: since.toISOString(),
    end_date: until ? until.toISOString() : undefined,
    order_status_code: statusCode,
  });

  const orderIds = await parseApiResponse(
    response,
    z.object({ order_ids: z.number().array() }),
  );

  return orderIds.order_ids;
}

export async function getOrder(orderId: number) {
  const response = await makeApiRequest("get_order", {
    order_id: orderId,
  });

  return await parseApiResponse(response, CoreforceOrder);
}

/**
 * @throws {Error} If the API returns an error or the range is too large
 */
export async function getOrders(filter: {
  since: Date;
  until?: Date;
  allowLargeRanges?: boolean;
  strictRange?: boolean;
  statusCode?: OrderStatusCode;
  contactId?: number;
  email?: string;
}) {
  // time range
  const { since, until, allowLargeRanges, strictRange, statusCode } = filter;

  const orderIds = await getOrderIds({
    since,
    until,
    allowLargeRanges,
    statusCode,
  });

  const orders = [];

  // Perform API requests one at a time to avoid the server geeking out
  for (const orderId of orderIds) {
    const order = await getOrder(orderId);

    if (
      strictRange &&
      (order.details.order_time < since ||
        (until && order.details.order_time > until))
    )
      continue;

    // filter if necessary
    if (filter) {
      if (
        filter.contactId !== undefined &&
        order.details.contact_id !== filter.contactId
      )
        continue;
      if (
        filter.email !== undefined &&
        order.details.email_address !== filter.email
      )
        continue;
    }

    orders.push(order);
  }

  return orders;
}
