#[test_only]
module hashcat::sbtc_tests {
    use std::vector;
    use sui::test_scenario;
    use sui::clock;
    use hashcat::sbtc;
    use sui::coin;

    #[test]
    fun test_mint_and_burn() {
        let scenario = test_scenario::begin(@0x1);
        
        // 初始化系统
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            sbtc::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // 获取系统状态和地址映射
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            let system_state = test_scenario::take_shared<sbtc::SystemState>(&scenario);
            let btc_mapping = test_scenario::take_shared<sbtc::BtcAddressMapping>(&scenario);
            let admin_cap = test_scenario::take_from_sender<sbtc::AdminCap>(&scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
            
            // 测试铸币
            let amount = 1000;
            let btc_address = b"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
            let signatures = vector::empty<vector<u8>>();
            vector::push_back(&mut signatures, b"signature1");
            vector::push_back(&mut signatures, b"signature2");
            vector::push_back(&mut signatures, b"signature3");
            
            sbtc::mint(
                &mut system_state,
                &mut btc_mapping,
                amount,
                btc_address,
                signatures,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // 清理
            test_scenario::return_shared(system_state);
            test_scenario::return_shared(btc_mapping);
            test_scenario::return_to_sender(&scenario, admin_cap);
            clock::destroy_for_testing(clock);
        };

        // 在新的交易中测试销毁
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            let system_state = test_scenario::take_shared<sbtc::SystemState>(&scenario);
            let btc_mapping = test_scenario::take_shared<sbtc::BtcAddressMapping>(&scenario);
            let admin_cap = test_scenario::take_from_sender<sbtc::AdminCap>(&scenario);
            
            // 创建一个时间戳大于时间锁的时钟对象
            let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, 100000000); // 设置一个足够大的时间戳
            
            let sbtc_coin = test_scenario::take_from_sender<coin::Coin<sbtc::SBTC>>(&scenario);
            let btc_address = b"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
            
            sbtc::burn(
                &mut system_state,
                &mut btc_mapping,
                sbtc_coin,
                btc_address,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // 清理
            test_scenario::return_shared(system_state);
            test_scenario::return_shared(btc_mapping);
            test_scenario::return_to_sender(&scenario, admin_cap);
            clock::destroy_for_testing(clock);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_pause_and_unpause() {
        let scenario = test_scenario::begin(@0x1);
        
        // 初始化系统
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            sbtc::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // 获取系统状态
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            let system_state = test_scenario::take_shared<sbtc::SystemState>(&scenario);
            let admin_cap = test_scenario::take_from_sender<sbtc::AdminCap>(&scenario);
            
            // 测试暂停
            sbtc::pause(&mut system_state, &admin_cap);
            
            // 测试恢复
            sbtc::unpause(&mut system_state, &admin_cap);
            
            // 清理
            test_scenario::return_shared(system_state);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        test_scenario::end(scenario);
    }
} 