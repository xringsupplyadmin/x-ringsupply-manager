CREATE MIGRATION m1mkuds4m232xenc25i6va4jic7hfpxjnyhf5j4gdlohkt7r2o5kna
    ONTO m1hse5in3xvimwv4trtpketbtvevj3ledikzbp3w32hhymwass2vra
{
  CREATE MODULE coreforce IF NOT EXISTS;
  CREATE SCALAR TYPE coreforce::IssueType EXTENDING enum<Description, Title, Image, StateRestriction, Other>;
  CREATE TYPE coreforce::ProductIssue {
      CREATE PROPERTY email: std::str;
      CREATE PROPERTY extra: std::str;
      CREATE REQUIRED PROPERTY issueType: coreforce::IssueType;
      CREATE REQUIRED PROPERTY productId: std::int64;
      CREATE PROPERTY stateRestrictionCurrent: array<std::str>;
      CREATE PROPERTY stateRestrictionUpdated: array<std::str>;
  };
};
