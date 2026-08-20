FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite headers expires

ENV APACHE_DOCUMENT_ROOT=/data/www/410_seismic_www/htdocs \
    CSN_BASE_DIR=/data/www/410_seismic_www

RUN sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf \
    && printf '%s\n' \
        '<Directory /data/www/410_seismic_www/htdocs>' \
        '    Options FollowSymLinks' \
        '    AllowOverride All' \
        '    Require all granted' \
        '</Directory>' \
        'ServerName localhost' \
        > /etc/apache2/conf-available/csn-www.conf \
    && a2enconf csn-www

WORKDIR /data/www/410_seismic_www

COPY . /data/www/410_seismic_www
