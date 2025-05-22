CREATE MIGRATION m1bt7air452st4d2niryou236xxwoxy4ry4xmyx5ikwgojh3kwbeuq
    ONTO m1j6e5aohjookxzwdb5ueno4amgpbbmnt6pztrqaldeegcds64pk3a
{
  ALTER TYPE default::UserPermission {
      DROP PROPERTY moduleRead;
  };
  ALTER TYPE default::UserPermission {
      DROP PROPERTY moduleWrite;
  };
  ALTER TYPE default::UserPermission {
      CREATE MULTI PROPERTY modules: tuple<moduleName: default::ModuleName, write: std::bool>;
  };
};
