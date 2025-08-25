import { DataSourceDelegate, EntityCollection } from "@firecms/core";

export const carsCollection = (dataSourceDelegate: DataSourceDelegate): EntityCollection => ({
        slug: "cars",
        name: "Cars",
        dbPath: "cars",
        editable: true,
        icon: "broken_image",
        overrides: {
            dataSourceDelegate
        },
        properties: {
            brand_name: {
                validation: {
                    required: true
                },
                type: "string",
                enum: [
                    {
                        label: "Alfa Romero",
                        id: "alfa-romero"
                    },
                    {
                        id: "audi",
                        label: "Audi"
                    },
                    {
                        id: "bmw",
                        label: "Bmw"
                    },
                    {
                        label: "Chevrolet",
                        id: "chevrolet"
                    },
                    {
                        id: "dodge",
                        label: "Dodge"
                    },
                    {
                        label: "Honda",
                        id: "honda"
                    },
                    {
                        label: "Isuzu",
                        id: "isuzu"
                    },
                    {
                        id: "jaguar",
                        label: "Jaguar"
                    },
                    {
                        id: "mazda",
                        label: "Mazda"
                    },
                    {
                        label: "Mercedes Benz",
                        id: "mercedes-benz"
                    },
                    {
                        id: "mercury",
                        label: "Mercury"
                    },
                    {
                        id: "mitsubishi",
                        label: "Mitsubishi"
                    },
                    {
                        label: "Nissan",
                        id: "nissan"
                    },
                    {
                        label: "Peugot",
                        id: "peugot"
                    },
                    {
                        id: "plymouth",
                        label: "Plymouth"
                    },
                    {
                        label: "Porsche",
                        id: "porsche"
                    },
                    {
                        label: "Saab",
                        id: "saab"
                    },
                    {
                        id: "subaru",
                        label: "Subaru"
                    },
                    {
                        label: "Toyota",
                        id: "toyota"
                    },
                    {
                        id: "volkswagen",
                        label: "Volkswagen"
                    },
                    {
                        id: "volvo",
                        label: "Volvo"
                    }
                ],
                name: "Brand Name"
            },
            aspiration: {
                enum: [
                    {
                        id: "Aspired",
                        label: "Aspired"
                    },
                    {
                        id: "std",
                        label: "Std"
                    },
                    {
                        id: "turbo",
                        label: "Turbo"
                    }
                ],
                name: "Aspiration",
                type: "string",
                validation: {
                    required: true
                }
            },
            bore: {
                validation: {
                    required: true
                },
                name: "Bore",
                type: "number"
            },
            city_mileage: {
                name: "City Mileage",
                type: "number",
                validation: {
                    required: true
                }
            },
            compression_ratio: {
                name: "Compression Ratio",
                validation: {
                    required: true
                },
                type: "number"
            },
            cylinder_count: {
                name: "Cylinder Count",
                type: "string",
                enum: [
                    {
                        id: "eight",
                        label: "Eight"
                    },
                    {
                        label: "Five",
                        id: "five"
                    },
                    {
                        id: "four",
                        label: "Four"
                    },
                    {
                        label: "Six",
                        id: "six"
                    },
                    {
                        label: "Twelve",
                        id: "twelve"
                    },
                    {
                        id: "two",
                        label: "Two"
                    }
                ],
                validation: {
                    required: true
                }
            },
            design: {
                validation: {
                    required: true
                },
                enum: [
                    {
                        label: "Convertible",
                        id: "convertible"
                    },
                    {
                        id: "hardtop",
                        label: "Hardtop"
                    },
                    {
                        id: "hatchback",
                        label: "Hatchback"
                    },
                    {
                        id: "sedan",
                        label: "Sedan"
                    },
                    {
                        id: "wagon",
                        label: "Wagon"
                    }
                ],
                type: "string",
                name: "Design"
            },
            door_panel: {
                type: "string",
                validation: {
                    required: true
                },
                enum: [
                    {
                        id: "four",
                        label: "Four"
                    },
                    {
                        id: "two",
                        label: "Two"
                    }
                ],
                name: "Door Panel"
            },
            engine_location: {
                validation: {
                    required: true
                },
                enum: [
                    {
                        label: "Front",
                        id: "front"
                    },
                    {
                        id: "rear",
                        label: "Rear"
                    }
                ],
                type: "string",
                name: "Engine Location"
            },
            engine_size: {
                type: "number",
                validation: {
                    required: true
                },
                name: "Engine Size"
            },
            engine_type: {
                name: "Engine Type",
                type: "string",
                enum: [
                    {
                        label: "Dohc",
                        id: "dohc"
                    },
                    {
                        label: "Dohcv",
                        id: "dohcv"
                    },
                    {
                        label: "L",
                        id: "l"
                    },
                    {
                        label: "Ohc",
                        id: "ohc"
                    },
                    {
                        id: "ohcf",
                        label: "Ohcf"
                    },
                    {
                        id: "ohcv",
                        label: "Ohcv"
                    },
                    {
                        label: "Rotor",
                        id: "rotor"
                    }
                ],
                validation: {
                    required: true
                }
            },
            fuel_system: {
                enum: [
                    {
                        id: "1bbl",
                        label: "1bbl"
                    },
                    {
                        id: "2bbl",
                        label: "2bbl"
                    },
                    {
                        id: "4bbl",
                        label: "4bbl"
                    },
                    {
                        id: "idi",
                        label: "Idi"
                    },
                    {
                        label: "Mpfi",
                        id: "mpfi"
                    },
                    {
                        label: "Spdi",
                        id: "spdi"
                    },
                    {
                        id: "spfi",
                        label: "Spfi"
                    }
                ],
                type: "string",
                validation: {
                    required: true
                },
                name: "Fuel System"
            },
            fuel_type: {
                name: "Fuel Type",
                enum: [
                    {
                        id: "diesel",
                        label: "Diesel"
                    },
                    {
                        id: "gas",
                        label: "Gas"
                    }
                ],
                type: "string",
                validation: {
                    required: true
                }
            },
            highway_mileage: {
                type: "number",
                name: "Highway Mileage",
                validation: {
                    required: true
                }
            },
            horse_power: {
                name: "Horse Power",
                type: "number",
                validation: {
                    required: true
                }
            },
            price_in_dollars: {
                name: "Price In Dollars",
                validation: {
                    required: true
                },
                type: "number"
            },
            stroke: {
                type: "number",
                name: "Stroke",
                validation: {
                    required: true
                }
            },
            top_rpm: {
                type: "number",
                validation: {
                    required: true
                },
                name: "Top Rpm"
            },
            wheel_drive: {
                name: "Wheel Drive",
                validation: {
                    required: true
                },
                enum: [
                    {
                        id: "4wd",
                        label: "4wd"
                    },
                    {
                        label: "Fwd",
                        id: "fwd"
                    },
                    {
                        label: "Rwd",
                        id: "rwd"
                    }
                ],
                type: "string"
            }
        },
        subcollections: () => []
    }
)
