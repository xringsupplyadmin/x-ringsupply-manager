module utils {
  type SassHeader {
    required internal: bool;
    required name: str {
      constraint exclusive;
      constraint min_len_value(1);
    };
    required value: str;
    required includeOrder: int64;

    constraint exclusive on ((.internal, .includeOrder));
  }

  function nextIncludeOrder(internal: bool) -> int64
  using (
    with module utils
    select (
      select max(SassHeader.includeOrder) filter SassHeader.internal = internal
    ) ?? 0 + 1
  );
}