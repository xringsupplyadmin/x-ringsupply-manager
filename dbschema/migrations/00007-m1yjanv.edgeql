CREATE MIGRATION m1yjanvrdspso7ijabu5mh6yudscpdfhxnqraxjq6rz26mbvjorwoq
    ONTO m1wkemzi36xji4repvlx6hdm2yw5c4mtshowjyoexxueh3r74yl63a
{
  ALTER TYPE coreforce::Contact {
      CREATE PROPERTY unsubscribed: std::bool {
          SET default := false;
      };
  };
};
