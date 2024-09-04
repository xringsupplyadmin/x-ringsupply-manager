CREATE MIGRATION m1sxdihliigvpnkuijnsb3cor2hnkrw6mb75whzbs7qh7527lrt3nq
    ONTO initial
{
  CREATE MODULE coreforce IF NOT EXISTS;
  CREATE FUTURE nonrecursive_access_policies;
  CREATE TYPE coreforce::CartItem {
      CREATE REQUIRED PROPERTY cartId: std::int64;
      CREATE REQUIRED PROPERTY cartItemId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str {
          SET default := '';
      };
      CREATE REQUIRED PROPERTY imageUrl: std::str;
      CREATE REQUIRED PROPERTY listPrice: std::float64 {
          SET default := 0.0;
      };
      CREATE REQUIRED PROPERTY productId: std::int64;
      CREATE REQUIRED PROPERTY quantity: std::int64;
      CREATE REQUIRED PROPERTY smallImageUrl: std::str;
      CREATE REQUIRED PROPERTY timeSubmitted: std::datetime;
      CREATE REQUIRED PROPERTY unitPrice: std::float64 {
          SET default := 0.0;
      };
  };
  CREATE TYPE coreforce::Contact {
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.email);
      CREATE REQUIRED PROPERTY cfContactId: std::int64;
      CREATE REQUIRED PROPERTY fullName: std::str;
      CREATE REQUIRED PROPERTY unsubscribed: std::bool {
          SET default := false;
      };
  };
  ALTER TYPE coreforce::CartItem {
      CREATE REQUIRED LINK contact: coreforce::Contact;
  };
  ALTER TYPE coreforce::Contact {
      CREATE MULTI LINK items := (.<contact[IS coreforce::CartItem]);
  };
  CREATE TYPE coreforce::EmailTask {
      CREATE REQUIRED LINK contact: coreforce::Contact {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY origination: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY sequence: std::int64 {
          SET default := 0;
      };
  };
  ALTER TYPE coreforce::Contact {
      CREATE LINK activeTask := (.<contact[IS coreforce::EmailTask]);
  };
  CREATE TYPE coreforce::EmailTaskStep {
      CREATE REQUIRED LINK contact: coreforce::Contact;
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE REQUIRED PROPERTY sequence: std::int64;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY time: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE coreforce::Contact {
      CREATE MULTI LINK steps := (.<contact[IS coreforce::EmailTaskStep]);
  };
  CREATE TYPE default::Account {
      CREATE REQUIRED PROPERTY provider: std::str;
      CREATE REQUIRED PROPERTY providerAccountId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE CONSTRAINT std::exclusive ON ((.provider, .providerAccountId));
      CREATE PROPERTY access_token: std::str;
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY expires_at: std::int64;
      CREATE PROPERTY id_token: std::str;
      CREATE PROPERTY refresh_token: std::str;
      CREATE PROPERTY scope: std::str;
      CREATE PROPERTY session_state: std::str;
      CREATE PROPERTY token_type: std::str;
      CREATE REQUIRED PROPERTY type: std::str;
  };
  CREATE TYPE default::User {
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY emailVerified: std::datetime;
      CREATE PROPERTY image: std::str;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE default::Account {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK accounts := (.<user[IS default::Account]);
  };
  CREATE TYPE default::InngestError {
      CREATE PROPERTY acknowledged: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY errorName: std::str;
      CREATE REQUIRED PROPERTY functionId: std::str;
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE REQUIRED PROPERTY runId: std::str;
      CREATE PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  CREATE TYPE default::Session {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY sessionToken: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK sessions := (.<user[IS default::Session]);
  };
  CREATE TYPE default::UserPermission {
      CREATE REQUIRED LINK user: default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY verified: std::bool {
          SET default := (SELECT
              (std::count(default::User) = 1)
          );
      };
  };
  CREATE TYPE default::VerificationToken {
      CREATE REQUIRED PROPERTY identifier: std::str;
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE CONSTRAINT std::exclusive ON ((.identifier, .token));
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY expires: std::datetime;
  };
};
