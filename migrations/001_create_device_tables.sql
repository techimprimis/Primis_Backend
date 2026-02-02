create table primisapp.device_responses
(
    device_response_id bigserial
        constraint device_responses_pk
            primary key,
    device_id          bigint                                             not null
        constraint device_responses_devices_device_id_fk
            references primisapp.devices,
    response           jsonb                                              not null,
    topic              varchar(500)                                       not null
    created_at         timestamp with time zone default CURRENT_TIMESTAMP not null,
);

alter table primisapp.device_responses
    owner to postgres;

create index device_responses_response_jsonb_index
    on primisapp.device_responses using gin (response);