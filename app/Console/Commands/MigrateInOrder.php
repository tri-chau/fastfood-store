<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MigrateInOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate_in_order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute the migrations in the order specified in the file app/Console/Comands/MigrateInOrder.php \n Drop all the table in db before execute the command.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        /** Specify the names of the migrations files in the order you want to
         * loaded
         * $migrations =[
         *               'xxxx_xx_xx_000000_create_nameTable_table.php',
         *    ];
         */
        $migrations = [
            '2014_10_12_000000_create_users_table.php',
            '2014_10_12_100000_create_password_reset_tokens_table.php',
            '2019_08_19_000000_create_failed_jobs_table.php',
            '2019_12_14_000001_create_personal_access_tokens_table.php',
            '2024_09_24_065008_create_customers_table.php',
            '2024_09_24_065014_create_products_table.php',
            '2024_09_24_065019_create_categories_table.php',
            '2024_09_24_065025_create_orders_table.php',
            '2024_09_24_065027_create_customers_orders_table.php',
            '2024_09_24_065028_create_order_details_table.php',
            '2024_09_24_065033_create_vouchers_table.php',
            '2013_08_24_065114_create_teams_table.php',
            '2024_09_24_065305_create_notifications_table.php',
            '2024_09_25_163436_create_employees_table.php',
            '2024_09_25_164255_create_users_notifications_table.php',
            '2024_09_25_164327_create_orderdetails_products_table.php',
            '2024_09_25_164938_create_categories_products.php',
            '2024_09_25_165256_create_tags_table.php',
            '2024_09_25_165353_create_products_tags.php',
            '2024_09_26_055316_create_teams_vouchers_table.php',
            '2024_09_26_061204_create_products_toppings_table.php',
            '2024_09_26_062129_create_products_vouchers_table.php',
            '2024_09_26_064113_create_permission_tables.php'
        ];

        foreach($migrations as $migration)
        {
            $basePath = 'database/migrations/';
            $migrationName = trim($migration);
            $path = $basePath.$migrationName;
            $this->call('migrate:refresh', [
                '--path' => $path ,
            ]);
        }
    }
}
