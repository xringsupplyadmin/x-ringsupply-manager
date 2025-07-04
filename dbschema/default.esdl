module default {
    scalar type ModuleName extending enum<ItemTags, ProductEditor, CRM, Klaviyo>;
    
    type User {
        property name -> str;
        required property email -> str {
            constraint exclusive;
        }
        property emailVerified -> datetime;
        property image -> str;
        multi link accounts := .<user[is Account];
        multi link sessions := .<user[is Session];
        property createdAt -> datetime {
            default := datetime_current();
        };
        link permission := .<user[is UserPermission];
    }

    type UserPermission {
        required user: User {
            constraint exclusive;
        };
        required administrator: bool {
            default := (select count(User) = 1);
        }
        required verified: bool {
            default := .administrator;
        };
        multi modules: tuple<moduleName: ModuleName, write: bool>;
    }
 
    type Account {
       required property userId := .user.id;
       required property type -> str;
       required property provider -> str;
       required property providerAccountId -> str {
        constraint exclusive;
       };
       property refresh_token -> str;
       property access_token -> str;
       property expires_at -> int64;
       property token_type -> str;
       property scope -> str;
       property id_token -> str;
       property session_state -> str;
       required link user -> User {
            on target delete delete source;
       };
       property createdAt -> datetime {
            default := datetime_current();
        };
 
       constraint exclusive on ((.provider, .providerAccountId))
    }
 
    type Session {
        required property sessionToken -> str {
            constraint exclusive;
        }
        required property userId := .user.id;
        required property expires -> datetime;
        required link user -> User {
            on target delete delete source;
        };
        property createdAt -> datetime {
            default := datetime_current();
        };
    }
 
    type VerificationToken {
        required property identifier -> str;
        required property token -> str {
            constraint exclusive;
        }
        required property expires -> datetime;
        property createdAt -> datetime {
            default := datetime_current();
        };
 
        constraint exclusive on ((.identifier, .token))
    }

    type InngestError {
      required functionId: str;
      required errorName: str;
      required message: str;
      required runId: str;
      timestamp: datetime {
        default := datetime_current();
      }
      acknowledged: bool {
        default := false;
      }
    }
}
 
# Disable the application of access policies within access policies
# themselves. This behavior will become the default in EdgeDB 3.0.
# See: https://www.edgedb.com/docs/reference/ddl/access_policies#nonrecursive
using future nonrecursive_access_policies;