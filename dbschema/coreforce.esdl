module coreforce {
  type Contact {
    required fullName: str;
    required email: str {
      constraint exclusive;
    };
    required cfContactId: int64;
    multi items := .<contact[is CartItem];
    activeTask := .<contact[is EmailTask];
    multi steps := .<contact[is EmailTaskStep];
    required unsubscribed: bool {
      default := false;
    }

    index on (.email);
  }

  type CartItem {
    required cartItemId: int64 {
      constraint exclusive;
    }
    required cartId: int64;
    required productId: int64;
    required description: str {
      default := "";
    }
    required timeSubmitted: datetime;
    required quantity: int64;
    required unitPrice: float64 {
      default := 0.0;
    }
    required listPrice: float64 {
      default := 0.0;
    }
    required smallImageUrl: str;
    required imageUrl: str;
    required contact: Contact;
  }

  type EmailTask {
    required contact: Contact {
      constraint exclusive;
    }
    required sequence: int64 {
      default := 0;
    };
    required origination: datetime {
      default := datetime_current();
    }
  }

  type EmailTaskStep {
    required contact: Contact;
    required sequence: int64;
    required success: bool;
    required message: str;
    required time: datetime {
      default := datetime_current();
    }
  }
}