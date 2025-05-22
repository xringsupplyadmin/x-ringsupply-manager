CREATE MIGRATION m1j6e5aohjookxzwdb5ueno4amgpbbmnt6pztrqaldeegcds64pk3a
    ONTO m1uwrxz6eoe5oj7m2vgrklj2o63jo5htx7vfk7omr7hwwcwbb6ch2q
{
  CREATE SCALAR TYPE default::ModuleName EXTENDING enum<ItemTags, ProductEditor, CRM>;
  ALTER TYPE default::UserPermission {
      CREATE REQUIRED PROPERTY administrator: std::bool {
          SET default := (SELECT
              (std::count(default::User) = 1)
          );
      };
      ALTER PROPERTY verified {
          SET default := (.administrator);
      };
      CREATE MULTI PROPERTY moduleRead: default::ModuleName;
      CREATE MULTI PROPERTY moduleWrite: default::ModuleName;
  };
};
