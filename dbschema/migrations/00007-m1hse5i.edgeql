CREATE MIGRATION m1hse5in3xvimwv4trtpketbtvevj3ledikzbp3w32hhymwass2vra
    ONTO m1d6q2axk7vbikhu4b7oeurwebmu32sc5dzmdp4uqvp2u4fzhh4d5a
{
  ALTER TYPE default::User {
      CREATE LINK permission := (.<user[IS default::UserPermission]);
  };
};
