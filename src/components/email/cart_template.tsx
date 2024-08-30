import { Column, Img, Row, Section, Text } from "@react-email/components";
import { renderAsync } from "@react-email/render";
import { env } from "~/env";
import { formatDate } from "~/lib/utils";

type DebugInfo = {
  sequence: number;
  name: string;
  email: string;
  origination: Date;
};

type EmailCartItem = {
  cartItemId: number;
  description: string;
  smallImageUrl: string;
  unitPrice: number;
  listPrice: number;
  quantity: number;
};

function formatPrice(price: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })
    .format(price)
    .replace("$", "$\u00A0");
}

function getDisplayPrice(item: EmailCartItem) {
  return (
    <Text style={{ fontSize: "16px", marginLeft: "8px" }}>
      <span>{item.quantity}&nbsp;x</span>
      <span
        // Price container
        style={{
          display: "block",
          width: "max-content",
          marginLeft: "auto",
        }}
      >
        {/* Only flex the discount if its good (10% or more) */}
        {item.listPrice != 0 && item.listPrice >= item.unitPrice * 1.1 ? (
          <>
            <span style={{ display: "block", textDecoration: "line-through" }}>
              {formatPrice(item.listPrice)}
            </span>{" "}
            <span
              style={{
                display: "block",
                color: "#c92d18",
                fontStyle: "italic",
              }}
            >
              {formatPrice(item.unitPrice)}
            </span>
          </>
        ) : (
          formatPrice(item.unitPrice)
        )}
      </span>
    </Text>
  );
}

export function DebugInfo({ debug }: { debug: DebugInfo }) {
  return (
    <>
      <Text style={{ fontStyle: "italic" }}>**** Debug Info ****</Text>
      <Text style={{ marginTop: 0 }}>
        {debug.sequence} - Origin:
        {formatDate(debug.origination)}
      </Text>
      <Text style={{ marginTop: 0 }}>
        {debug.name} - {debug.email}
      </Text>
    </>
  );
}

export function CartTemplate({
  items,
  debug,
}: {
  items: EmailCartItem[];
  debug?: DebugInfo;
}) {
  return (
    <Section>
      {items.map((item) => (
        <CartItemTemplate key={item.cartItemId} item={item} />
      ))}
      {env.DEBUG && debug && <DebugInfo debug={debug} />}
    </Section>
  );
}

export function CartItemTemplate({ item }: { item: EmailCartItem }) {
  const priceContainer = getDisplayPrice(item);
  return (
    <Row style={{ marginBottom: "16px" }}>
      <Column style={{ verticalAlign: "top", width: "100px" }}>
        <Img
          style={{
            borderRadius: "6px",
            objectFit: "cover",
            width: "100px",
            height: "100px",
          }}
          width="300px"
          height="300px"
          src={item.smallImageUrl}
        />
      </Column>
      <Column style={{ paddingLeft: "25px" }}>
        <h4 style={{ margin: 0 }}>{item.description}</h4>
        <Column style={{ textAlign: "right" }}>{priceContainer}</Column>
      </Column>
    </Row>
  );
}

export async function getTemplateHtml(template: JSX.Element) {
  return await renderAsync(template, { pretty: false });
}
