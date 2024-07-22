CREATE MIGRATION m1wxr3lrbjcm5jiyuwmr5sqjllfsekhllc4t5sqsrv4dv5idjagyta
    ONTO m1axe7ztzzvkka277jvgxzyhrupdsui7jvhelulgxgjqwp6woepcla
{
  ALTER TYPE coreforce::Contact {
      CREATE LINK activeTask := (.<contact[IS coreforce::EmailTask]);
  };
  ALTER TYPE coreforce::EmailTaskStep {
      CREATE REQUIRED LINK contact: coreforce::Contact {
          SET REQUIRED USING (<coreforce::Contact>{});
      };
  };
  ALTER TYPE coreforce::Contact {
      CREATE MULTI LINK steps := (.<contact[IS coreforce::EmailTaskStep]);
  };
  ALTER TYPE coreforce::EmailTaskStep {
      DROP LINK task;
  };
};
