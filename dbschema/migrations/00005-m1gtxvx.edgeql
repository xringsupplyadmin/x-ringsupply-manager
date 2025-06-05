CREATE MIGRATION m1gtxvxeu4vdec2f4lt7ybtg5pdo7c3gsevph2mqdvdvn6owkddrya
    ONTO m1bt7air452st4d2niryou236xxwoxy4ry4xmyx5ikwgojh3kwbeuq
{
  ALTER SCALAR TYPE default::ModuleName EXTENDING enum<ItemTags, ProductEditor, CRM, Klaviyo>;
};
