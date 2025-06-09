CREATE MIGRATION m1d6q2axk7vbikhu4b7oeurwebmu32sc5dzmdp4uqvp2u4fzhh4d5a
    ONTO m1gtxvxeu4vdec2f4lt7ybtg5pdo7c3gsevph2mqdvdvn6owkddrya
{
  ALTER TYPE coreforce::Contact {
      DROP LINK items;
      DROP INDEX ON (.email);
      DROP LINK activeTask;
      DROP LINK steps;
      DROP PROPERTY cfContactId;
      DROP PROPERTY email;
      DROP PROPERTY fullName;
      DROP PROPERTY unsubscribed;
  };
  DROP TYPE coreforce::CartItem;
  DROP TYPE coreforce::EmailTask;
  DROP TYPE coreforce::EmailTaskStep;
  DROP TYPE coreforce::Contact;
  DROP MODULE coreforce;
};
