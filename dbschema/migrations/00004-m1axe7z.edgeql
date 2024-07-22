CREATE MIGRATION m1axe7ztzzvkka277jvgxzyhrupdsui7jvhelulgxgjqwp6woepcla
    ONTO m1mathvyahgcumgitvjq3do24kwrkyrputueeaylajmfl4zadxhuvq
{
  CREATE TYPE coreforce::EmailTaskStep {
      CREATE REQUIRED LINK task: coreforce::EmailTask;
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE PROPERTY sequence: std::int64;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY time: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  DROP TYPE coreforce::TaskError;
};
