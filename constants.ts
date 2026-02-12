export const SAMPLE_LOG = `2026-02-12T09:10:55.6332177Z        [33m~ [0m [0m security_rule       = [
2026-02-12T09:10:55.6332627Z            [31m- [0m [0m {
2026-02-12T09:10:55.6333139Z                [31m- [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6333770Z                [31m- [0m [0m description                                = "DWH Backend SAP DS (QAS) to SAP FI PEAC LFK (QAS)"
2026-02-12T09:10:55.6334724Z                [31m- [0m [0m destination_address_prefix                 = "10.249.10.4/32"
2026-02-12T09:10:55.6335421Z                [31m- [0m [0m destination_address_prefixes               = []
2026-02-12T09:10:55.6336231Z                [31m- [0m [0m destination_application_security_group_ids = []
2026-02-12T09:10:55.6336899Z                [31m- [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6337482Z                    [31m- [0m [0m "5912",
2026-02-12T09:10:55.6337947Z                 ]
2026-02-12T09:10:55.6338544Z                [31m- [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6339214Z                [31m- [0m [0m name                                       = "NSGRULE_002_00100"
2026-02-12T09:10:55.6339837Z                [31m- [0m [0m priority                                   = 570
2026-02-12T09:10:55.6340463Z                [31m- [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6341129Z                [31m- [0m [0m source_address_prefix                      = "10.249.10.135/32"
2026-02-12T09:10:55.6341834Z                [31m- [0m [0m source_address_prefixes                    = []
2026-02-12T09:10:55.6342507Z                [31m- [0m [0m source_application_security_group_ids      = []
2026-02-12T09:10:55.6343426Z                [31m- [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6344112Z                [31m- [0m [0m source_port_ranges                         = []
2026-02-12T09:10:55.6345281Z             },
2026-02-12T09:10:55.6364207Z            [31m- [0m [0m {
2026-02-12T09:10:55.6365009Z                [31m- [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6365641Z                [31m- [0m [0m description                                = "DWH Frontend SAP BO/BI (QAS) to SAP HANADB PEAC DWH HDT (QAS)"
2026-02-12T09:10:55.6366478Z                [31m- [0m [0m destination_address_prefix                 = "10.249.10.132/32"
2026-02-12T09:10:55.6368189Z                [31m- [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6368707Z                    [31m- [0m [0m "30015",
2026-02-12T09:10:55.6369083Z                 ]
2026-02-12T09:10:55.6369584Z                [31m- [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6370134Z                [31m- [0m [0m name                                       = "NSGRULE_002_00101"
2026-02-12T09:10:55.6370639Z                [31m- [0m [0m priority                                   = 580
2026-02-12T09:10:55.6371172Z                [31m- [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6371947Z                [31m- [0m [0m source_address_prefix                      = "10.249.10.134/32"
2026-02-12T09:10:55.6373668Z                [31m- [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6375135Z             },
2026-02-12T09:10:55.6375562Z            [31m- [0m [0m {
2026-02-12T09:10:55.6376350Z                [31m- [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6376926Z                [31m- [0m [0m description                                = "RULE_00029 COM_00029"
2026-02-12T09:10:55.6378042Z                [31m- [0m [0m destination_application_security_group_ids = [
2026-02-12T09:10:55.6378874Z                    [31m- [0m [0m "/subscriptions/1a126c65-d2c8-4a7f-81ed-f6bcdac6c503/resourceGroups/RG-CORENETWORK-QAS-01/providers/Microsoft.Network/applicationSecurityGroups/ASG_00010_L3K_APPL_SERVER",
2026-02-12T09:10:55.6379410Z                 ]
2026-02-12T09:10:55.6379902Z                [31m- [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6380371Z                    [31m- [0m [0m "3301",
2026-02-12T09:10:55.6380750Z                 ]
2026-02-12T09:10:55.6381268Z                [31m- [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6381838Z                [31m- [0m [0m name                                       = "NSGRULE_002_00011"
2026-02-12T09:10:55.6383671Z                [31m- [0m [0m priority                                   = 100
2026-02-12T09:10:55.6384244Z                [31m- [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6384821Z                [31m- [0m [0m source_address_prefix                      = "10.249.10.4/32"
2026-02-12T09:10:55.6386898Z                [31m- [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6388361Z             },
2026-02-12T09:10:55.6710581Z            [32m+ [0m [0m {
2026-02-12T09:10:55.6710865Z                [32m+ [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6711207Z                [32m+ [0m [0m description                                = "DWH Backend SAP DS (QAS) to SAP FI PEAC LFK (QAS)"
2026-02-12T09:10:55.6711548Z                [32m+ [0m [0m destination_address_prefix                 = "10.249.10.4/32"
2026-02-12T09:10:55.6711864Z                [32m+ [0m [0m destination_address_prefixes               = []
2026-02-12T09:10:55.6712200Z                [32m+ [0m [0m destination_application_security_group_ids = []
2026-02-12T09:10:55.6712510Z                [32m+ [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6712779Z                    [32m+ [0m [0m "5912",
2026-02-12T09:10:55.6712987Z                 ]
2026-02-12T09:10:55.6713272Z                [32m+ [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6713580Z                [32m+ [0m [0m name                                       = "NSGRULE_002_00100"
2026-02-12T09:10:55.6713875Z                [32m+ [0m [0m priority                                   = 570
2026-02-12T09:10:55.6714167Z                [32m+ [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6714477Z                [32m+ [0m [0m source_address_prefix                      = "10.249.10.135/32"
2026-02-12T09:10:55.6714863Z                [32m+ [0m [0m source_address_prefixes                    = []
2026-02-12T09:10:55.6715163Z                [32m+ [0m [0m source_application_security_group_ids      = []
2026-02-12T09:10:55.6715469Z                [32m+ [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6715895Z                [32m+ [0m [0m source_port_ranges                         = []
2026-02-12T09:10:55.6716110Z             },
2026-02-12T09:10:55.6716351Z            [32m+ [0m [0m {
2026-02-12T09:10:55.6716634Z                [32m+ [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6716997Z                [32m+ [0m [0m description                                = "DWH Frontend SAP BO/BI (QAS) to SAP HANADB PEAC DWH HDT (QAS)"
2026-02-12T09:10:55.6717341Z                [32m+ [0m [0m destination_address_prefix                 = "10.249.10.132/32"
2026-02-12T09:10:55.6718249Z                [32m+ [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6718517Z                    [32m+ [0m [0m "30015",
2026-02-12T09:10:55.6718719Z                 ]
2026-02-12T09:10:55.6718996Z                [32m+ [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6719295Z                [32m+ [0m [0m name                                       = "NSGRULE_002_00101"
2026-02-12T09:10:55.6719581Z                [32m+ [0m [0m priority                                   = 580
2026-02-12T09:10:55.6719944Z                [32m+ [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6720250Z                [32m+ [0m [0m source_address_prefix                      = "10.249.10.134/32"
2026-02-12T09:10:55.6721150Z                [32m+ [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6721642Z             },
2026-02-12T09:10:55.6721874Z            [32m+ [0m [0m {
2026-02-12T09:10:55.6722154Z                [32m+ [0m [0m access                                     = "Allow"
2026-02-12T09:10:55.6722471Z                [32m+ [0m [0m description                                = "RULE_00029 COM_00029"
2026-02-12T09:10:55.6723085Z                [32m+ [0m [0m destination_application_security_group_ids = [
2026-02-12T09:10:55.6723539Z                    [32m+ [0m [0m "/subscriptions/1a126c65-d2c8-4a7f-81ed-f6bcdac6c503/resourceGroups/rg-CoreNetwork-qas-01/providers/Microsoft.Network/applicationSecurityGroups/ASG_00010_L3K_Appl_Server",
2026-02-12T09:10:55.6723835Z                 ]
2026-02-12T09:10:55.6724107Z                [32m+ [0m [0m destination_port_ranges                    = [
2026-02-12T09:10:55.6724375Z                    [32m+ [0m [0m "3301",
2026-02-12T09:10:55.6724583Z                 ]
2026-02-12T09:10:55.6724861Z                [32m+ [0m [0m direction                                  = "Inbound"
2026-02-12T09:10:55.6725171Z                [32m+ [0m [0m name                                       = "NSGRULE_002_00011"
2026-02-12T09:10:55.6725462Z                [32m+ [0m [0m priority                                   = 100
2026-02-12T09:10:55.6725855Z                [32m+ [0m [0m protocol                                   = "Tcp"
2026-02-12T09:10:55.6726171Z                [32m+ [0m [0m source_address_prefix                      = "10.249.10.4/32"
2026-02-12T09:10:55.6727156Z                [32m+ [0m [0m source_port_range                          = "*"
2026-02-12T09:10:55.6727955Z             },
        ]`;