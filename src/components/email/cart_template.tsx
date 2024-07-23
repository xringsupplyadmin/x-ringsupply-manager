import { Column, Img, Row, Section, Text } from "@react-email/components";
import { renderAsync } from "@react-email/render";
import { formatDate } from "~/lib/utils";
import { type ProductAddon, type CartItemWithAddons } from "~/server/db/types";

function getItemListPrice(item: CartItemWithAddons) {
  return item.addons.reduce(
    (sum, addon) => sum + addon.salePrice,
    item.listPrice,
  );
}

function getDisplayPrice(item: CartItemWithAddons) {
  const listPrice = getItemListPrice(item);

  // Only flex the discount if its good (10% or more)
  return (
    <Text style={{ fontSize: "16px" }}>
      {item.quantity}&nbsp;x{" "}
      {listPrice != 0 && listPrice >= item.unitPrice * 1.1 ? (
        <>
          <span style={{ textDecoration: "line-through" }}>
            $&nbsp;{listPrice}
          </span>{" "}
          <span style={{ color: "#c92d18", fontStyle: "italic" }}>
            $&nbsp;{item.unitPrice}
          </span>
        </>
      ) : (
        "$\u00A0" + item.unitPrice
      )}
    </Text>
  );
}

type DebugInfo = {
  sequence: string;
  firstName: string;
  lastName: string;
  email: string;
  origination: Date;
};

export function DebugInfo({ debug }: { debug: DebugInfo }) {
  return (
    <>
      <Text style={{ fontStyle: "italic" }}>**** Debug Info ****</Text>
      <Text style={{ marginTop: 0 }}>
        {debug.sequence} - Origin:
        {formatDate(debug.origination)}
      </Text>
      <Text style={{ marginTop: 0 }}>
        {debug.firstName} {debug.lastName} - {debug.email}
      </Text>
    </>
  );
}

export function CartTemplate({
  items,
  debug,
}: {
  items: CartItemWithAddons[];
  debug?: DebugInfo;
}) {
  return (
    <Section>
      {items.map((item) => (
        <CartItemTemplate key={item.cartItemId} item={item} />
      ))}
      {debug && <DebugInfo debug={debug} />}
    </Section>
  );
}

export function CartItemTemplate({ item }: { item: CartItemWithAddons }) {
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
        {/* {item.addons.length > 0 ? (
          <Row>
            <ProductAddonsTemplate addons={item.addons} />
            {priceContainer}
          </Row>
        ) : (
          priceContainer
        )} */}
        <Column style={{ textAlign: "right" }}>{priceContainer}</Column>
      </Column>
    </Row>
  );
}

export function ProductAddonsTemplate({ addons }: { addons: ProductAddon[] }) {
  return (
    <>
      {addons.map((addon) => (
        <ProductAddonTemplate key={addon.productAddonId} addon={addon} />
      ))}
    </>
  );
}

export function ProductAddonTemplate({ addon }: { addon: ProductAddon }) {
  return (
    <Row style={{}}>
      <Column style={{ width: "75%" }}>
        {addon.groupDescription ? (
          <>
            <Text style={{ margin: 0 }}>{addon.groupDescription}</Text>
            <Text style={{ marginTop: 0 }}>{addon.description}</Text>
          </>
        ) : (
          <Text style={{ marginTop: 0 }}>{addon.description}</Text>
        )}
      </Column>
      <Text style={{ marginTop: 0, textAlign: "right" }}>
        $&nbsp;{addon.salePrice}
      </Text>
    </Row>
  );
}

export async function getTemplateHtml(template: JSX.Element) {
  return await renderAsync(template, { pretty: false });
}
