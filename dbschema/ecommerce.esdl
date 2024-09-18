module products {
  type Category {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
  }
  type Department {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    multi categories: Category;
  }
  type Manufacturer {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    detailed_description: str;
    meta_description: str;
    image_id: int64;
    required inactive: bool;
  }
  type Tag {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    detailed_description: str;
    meta_description: str;
    required inactive: bool;
  }
  type Location {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    required internalUse: bool;
    required inactive: bool;
  }
  type Product {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    detailedDescription: str;
    manufacturerSku: str;
    model: str;
    upcCode: str;
    linkName: str;
    productManufacturerId: int64;
    productCategoryIds: array<int64>;
    multi productCategories := (
      select Category filter .cfId in array_unpack(__source__.productCategoryIds)
    );
    productTagIds: array<int64>;
    multi productTags := (
      select Tag filter .cfId in array_unpack(__source__.productTagIds)
    );
    baseCost: float64;
    listPrice: float64;
    manufacturerAdvertisedPrice: float64;
    imageUrls: array<str>;
    imageId: int64;
    dateCreated: datetime;
    timeChanged: datetime;
    required sortOrder: int64 {
      default := 100;
    };
    manufacturerImageId: int64;
  }
}