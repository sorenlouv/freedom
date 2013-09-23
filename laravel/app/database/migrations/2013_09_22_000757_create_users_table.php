<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users', function(Blueprint $table)
		{
			$table->integer('id')->unique();
			$table->string('access_token');
			$table->string('secure_hash');
			$table->integer('attending_events');
			$table->integer('maybe_attending_events');
			$table->integer('declined_events');
			$table->integer('not_replied_events');
			$table->integer('birthday_events');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('users');
	}

}
