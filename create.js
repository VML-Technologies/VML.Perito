import fs from 'fs';

// This is a common and safe practice to avoid crashes if the file doesn't exist
try {
    // Load the CSV file. The 'utf8' encoding is essential for text files.
    const usersDataRaw = fs.readFileSync('users.csv', 'utf8');

    // Split the raw string into an array of lines.
    // Using a regex with \r? handles both Windows (\r\n) and Unix (\n) line endings.
    const usersDataLines = usersDataRaw.split(/\r?\n/);

    // Since the headers are now fixed, we no longer need to read them from the file.
    // We can skip the first line directly.

    let offices = {}
    const dataParsed = usersDataLines.slice(1).map(line => {
        // We use array destructuring with fixed variable names to extract the values.
        let [
            identificacion,
            nombre,
            mail,
            clave,
            ciudad,
            oficina,
            modulo,
            perfil
        ] = line.split(',');

        if (!ciudad) {
            ciudad = 'NACIONAL';
        }

        if (ciudad.includes('-')) {
            ciudad = ciudad.split('-')[0].trim();
        }

        if (!isNaN(ciudad)) {
            ciudad = 'NACIONAL';
        }

        // ad into offices office and city unique
        if (oficina) {
            offices[oficina?.toUpperCase()] = ciudad?.toUpperCase();
        }


        // Return a new object with the parsed and trimmed data.
        return {
            identificacion: identificacion ? identificacion.trim() : '',
            nombre: nombre ? nombre.trim() : '',
            mail: mail ? mail.trim() : '',
            clave: clave ? clave.trim() : '',
            ciudad: ciudad ? ciudad.trim() : '',
            oficina: oficina ? oficina.trim() : '',
            // modulo: modulo ? modulo.trim() : '',
            // perfil: perfil ? perfil.trim() : ''
        };
    });

    // Display the parsed data in a nice, readable table format in the console.
    console.table(dataParsed.slice(0, 10));

    console.log(offices);

    const distinctCities = [...new Set(Object.values(offices))];
    console.log(distinctCities);


    const sedesComercialSeeder = Object.keys(offices).map(office => {
        return {
            name: office,
            address: 'Carrera 15 # 93-47 Oficina 502',
            phone: '3000000000',
            email: 'no-reply@vmltechnologies.com',
            city_id: offices[office],
            company_id: 0, //TODO: SEARCH FOR Company.name = Seguros Mundial
            sede_type_id: 1, //await SedeType.findOne({ where: { code: 'COMERCIAL' } });
            vehicleTypes: [],
            schedules: []
        }
    })

    const usersSeeder = dataParsed.filter(user => {
        if (!user.nombre || !user.mail) {
            return false
        }
        return true

    }).map(user => {
        return {
            "userData": {
                "sede_id": "await Sede.findOne({ where: { name: '" + user.oficina + "' } });",
                "identification": user.identificacion,
                "name": user.nombre,
                "email": user.mail,
                "phone": "3043425127",
                "password": "hashedPassword",
                "is_active": true,
                "intermediary_key": user.clave,
                "notification_channel_in_app_enabled": true,
                "notification_channel_sms_enabled": true,
                "notification_channel_email_enabled": true,
                "notification_channel_whatsapp_enabled": true
            },
            "roles": [
                "comercial_mundial"
            ]
        }
    })

    // save to a file
    // fs.writeFileSync('users.json', JSON.stringify(usersSeeder, null, 4));
    console.log(sedesComercialSeeder.map(el => {
        return el.name
    }));

} catch (error) {
    console.error("Error reading or parsing the file:", error.message);
}
