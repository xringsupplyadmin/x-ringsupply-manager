CREATE MIGRATION m1mathvyahgcumgitvjq3do24kwrkyrputueeaylajmfl4zadxhuvq
    ONTO m1rt7ed3pcjjznrnpdd5jvnhjradqhsq6bqs7kz6dgeggksfuil7ka
{
  CREATE TYPE coreforce::TaskError {
      CREATE REQUIRED LINK contact: coreforce::Contact;
      CREATE REQUIRED PROPERTY error: std::str;
      CREATE REQUIRED PROPERTY sequence: std::int64;
      CREATE REQUIRED PROPERTY time: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
