<?php

namespace App\Console\Commands;

use Mcamara\LaravelLocalization\Commands\RouteTranslationsListCommand as BaseCommand;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(name: 'route:trans:list')]
class RouteTranslationsListCommand extends BaseCommand {}
