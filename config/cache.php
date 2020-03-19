<?php
return [
    'CACHE' => [
        'files' => [
            'CACHE_TYPE' => 'FileCache',
            'CACHE_PATH' => ROOT_PATH . 'tmp/cache/',
            'GROUP' => 'files',
            'HASH_DEEP' => 0,
        ],

        'redis' => [
            'CACHE_TYPE' => 'redis',
            'host' => '127.0.0.1',
            'port' => 6379,
            'group' => 0,
        ],
    ]
];