module ecommerce {
  type Category {
    required cfId: int64 {
      constraint exclusive;
    };
    required code: str {
      constraint exclusive;
    };
    required description: str;
    department := .<categories[is Department];
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
    detailedDescription: str;
    metaDescription: str;
    imageId: int64;
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
    detailedDescription: str;
    metaDescription: str;
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
    productManufacturer := (
      select Manufacturer filter .cfId = __source__.productManufacturerId
    );
    required productCategoryIds: array<int64>;
    multi productCategories := (
      select Category filter .cfId in array_unpack(__source__.productCategoryIds)
    );
    required productTagIds: array<int64>;
    multi productTags := (
      select Tag filter .cfId in array_unpack(__source__.productTagIds)
    );
    baseCost: float64;
    listPrice: float64;
    manufacturerAdvertisedPrice: float64;
    required imageUrls: array<str>;
    imageId: int64;
    required dateCreated: datetime;
    required timeChanged: datetime;
    required sortOrder: int64 {
      default := 100;
    };
    manufacturerImageId: int64;
  }
}