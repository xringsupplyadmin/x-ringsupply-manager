CREATE MIGRATION m1wkemzi36xji4repvlx6hdm2yw5c4mtshowjyoexxueh3r74yl63a
    ONTO m1wxr3lrbjcm5jiyuwmr5sqjllfsekhllc4t5sqsrv4dv5idjagyta
{
  CREATE TYPE default::UserPermission {
      CREATE REQUIRED LINK user: default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY verified: std::bool {
          SET default := false;
      };
  };
};
