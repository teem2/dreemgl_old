#!/usr/bin/ruby

require 'net/http'
require 'json'

uri = URI.parse("http://localhost:2000/extdemo")

devices = {
    'BEACON 814' => 'beacon',
    'Office' => 'home',
    'Laptop' => 'laptop',
    'Inbox' => 'message',
    'Bluetooth' => 'mic',
    'iPhone' => 'phone',
    'Charging' => 'power',
    'Brother 429' => 'printer',
    'Kitchen Lamp' => 'smartbulb',
    'Admin' => 'terminal',
    'LED H4500' => 'tv',
    'Wallet' => 'wallet',

    'WiFi' => 'beacon',
    'Home Network' => 'home',
    'Desktop' => 'laptop',
    'SMS' => 'message',
    'Android' => 'phone',
    'Air Print' => 'printer',
    'Lights' => 'smartbulb',
    'Smart TV' => 'tv'
}

loop do

  selected = devices.to_a.sample
  action = %w(join join part).sample

  req = Net::HTTP::Post.new(uri, initheader = {'Content-Type' =>'application/json'})

  body = {
      "rpcid" => "devbus",
      "type" => "method",
      "method" => "notify",
      "args" => [selected.first, selected.last, action]
  }.to_json
  puts body

  req.body = body


  res = Net::HTTP.start(uri.hostname, uri.port) do |http|
    http.request(req)
  end

  puts res
  sleep(3)

end

