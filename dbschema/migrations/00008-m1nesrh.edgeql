CREATE MIGRATION m1nesrhr4afuak5upnrruoazh6i63gbtfzvxnhtmrcfii5bpdwkj5q
    ONTO m1yjanvrdspso7ijabu5mh6yudscpdfhxnqraxjq6rz26mbvjorwoq
{
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
};
