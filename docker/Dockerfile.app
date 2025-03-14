FROM jkaninda/laravel-php-fpm:8.3
ARG WORKDIR=/var/www/html

# Copy laravel project files
COPY . $WORKDIR
# Storage Volume
VOLUME $WORKDIR/storage

WORKDIR $WORKDIR

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

COPY docker/php/php.ini $PHP_INI_DIR/conf.d/
COPY docker/php/opcache.ini $PHP_INI_DIR/conf.d/
COPY docker/php/xdebug.ini $PHP_INI_DIR/conf.d/
COPY docker/supervisord/supervisord.conf /etc/supervisor/supervisord.conf
COPY ./.env.example ./.env

# Fix permissions
RUN chown -R www-data:www-data $WORKDIR
USER www-data
RUN composer install --no-autoloader --no-scripts
EXPOSE 9000
CMD ["php-fpm", "supervisord -c /etc/supervisor/supervisord.conf"]
