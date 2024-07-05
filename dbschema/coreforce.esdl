module coreforce {
  type Contact {
    required contactId: int64 {
      constraint exclusive;
    };
    firstName: str;
    lastName: str;
    businessName: str;
    company: str;
    salutation: str;
    address1: str;
    address2: str;
    city: str;
    state: str;
    postalCode: str;
    country: str;
    primaryEmailAddress: str;
    notes: str;
    alternateEmail: str;
    phoneNumbers: str;
    phone: str;
    multi items := .<contact[is CartItem];

    index on (.contactId);
  }
  type CartItem {
    required cartItemId: int64;
    required cartId: int64;
    required productId: int64;
    description: str {
      default := "";
    }
    required timeSubmitted: datetime;
    required quantity: int64;
    required salePrice: float64 {
      default := 0.0;
    }
    required unitPrice: float64 {
      default := 0.0;
    }
    upcCode: str;
    manufacturerSku: str;
    model: str;
    listPrice: float64 {
      default := 0.0;
    }
    smallImageUrl: str;
    imageUrl: str;
    multi addons: ProductAddon;
    required contact: Contact;
  }
  type ProductAddon {
    required productAddonId: int64;
    required productId: int64;
    required description: str;
    groupDescription: str;
    required salePrice: float64;
    required sortOrder: int64;
    required cartItemAddonId: int64;
    required cartItemId: int64;
    required quantity: int64;

    constraint exclusive on ((.cartItemId, .productAddonId))
  }
}